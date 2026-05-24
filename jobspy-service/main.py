from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
import pandas as pd
import logging
import traceback

import re

try:
    from jobspy import scrape_jobs
except ImportError:
    scrape_jobs = None

logger = logging.getLogger("jobspy-service")

app = FastAPI(title="JobSpy Service", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_SITES = {"indeed", "linkedin", "zip_recruiter", "glassdoor", "google", "bayt", "bdjobs", "naukri"}
VALID_JOB_TYPES = {"fulltime", "parttime", "internship", "contract"}
VALID_DESCRIPTION_FORMATS = {"markdown", "html"}

GLASSDOOR_COUNTRIES = {
    "argentina", "australia", "austria", "belgium", "brazil", "canada",
    "chile", "france", "germany", "hong kong", "india", "ireland",
    "italaly", "japan", "luxembourg", "mexico", "netherlands", "new zealand",
    "nigeria", "norway", "panama", "peru", "philippines", "poland",
    "portugal", "singapore", "south africa", "south korea", "spain",
    "sweden", "switzerland", "taiwan", "thailand", "uk", "usa", "uruguay",
    "venezuela", "vietnam",
}

ZIP_RECRUITER_COUNTRIES = {"usa", "canada", "united states", "canada"}


def normalize_country(country: Optional[str]) -> str:
    if not country:
        return ""
    return country.strip().lower()


class SearchRequest(BaseModel):
    site_name: list[str] = Field(default=["indeed", "linkedin", "google"])
    search_term: str
    google_search_term: Optional[str] = None
    location: Optional[str] = None
    distance: int = Field(default=25, ge=1, le=500)
    job_type: Optional[str] = None
    is_remote: bool = False
    results_wanted: int = Field(default=15, ge=1, le=100)
    hours_old: Optional[int] = Field(default=None, ge=1)
    country_indeed: Optional[str] = None
    enforce_annual_salary: bool = False
    description_format: str = Field(default="markdown")
    linkedin_fetch_description: bool = False
    offset: int = Field(default=0, ge=0)

    class Config:
        extra = "ignore"


def sanitize_text(val) -> str | None:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    s = str(val)
    s = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', s)
    s = s.replace('\r\n', '\n').replace('\r', '\n')
    return s if s else None


def dataframe_to_dict(df: pd.DataFrame) -> list[dict]:
    if df is None or df.empty:
        return []
    results = []
    for _, row in df.iterrows():
        job = {
            "id": str(row.get("id", "")),
            "site": str(row.get("site", "")),
            "title": sanitize_text(row.get("title", "")),
            "company": sanitize_text(row.get("company", "")),
            "company_url": sanitize_text(row.get("company_url")),
            "job_url": sanitize_text(row.get("job_url")),
            "job_url_direct": sanitize_text(row.get("job_url_direct")),
            "location": sanitize_text(row.get("location")),
            "city": sanitize_text(row.get("city")),
            "state": sanitize_text(row.get("state")),
            "country": sanitize_text(row.get("country")),
            "is_remote": bool(row.get("is_remote", False)) if pd.notna(row.get("is_remote")) else False,
            "description": sanitize_text(row.get("description")),
            "job_type": sanitize_text(row.get("job_type")),
            "job_function": sanitize_text(row.get("job_function")),
            "min_amount": float(row["min_amount"]) if pd.notna(row.get("min_amount")) else None,
            "max_amount": float(row["max_amount"]) if pd.notna(row.get("max_amount")) else None,
            "currency": sanitize_text(row.get("currency")) or "USD",
            "salary_source": sanitize_text(row.get("salary_source")),
            "salary_interval": sanitize_text(row.get("interval")),
            "date_posted": sanitize_text(row.get("date_posted")),
            "emails": [str(e) for e in row.get("emails", [])] if pd.notna(row.get("emails")) else [],
            "company_industry": sanitize_text(row.get("company_industry")),
            "job_level": sanitize_text(row.get("job_level")),
            "company_logo": sanitize_text(row.get("company_logo")),
        }
        results.append(job)
    return results


def scrape_single_site(site: str, kwargs: dict) -> dict:
    try:
        df = scrape_jobs(site_name=[site], **kwargs)
        return {
            "site": site,
            "results": dataframe_to_dict(df),
            "error": None,
        }
    except Exception as e:
        logger.warning(f"JobSpy:{site} - failed: {e}")
        return {
            "site": site,
            "results": [],
            "error": str(e),
        }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "jobspy_available": scrape_jobs is not None,
    }


@app.post("/search")
async def search_jobs(req: SearchRequest):
    if scrape_jobs is None:
        raise HTTPException(status_code=503, detail="JobSpy library is not installed")

    for site in req.site_name:
        if site not in VALID_SITES:
            raise HTTPException(status_code=400, detail=f"Invalid site: {site}. Valid sites: {', '.join(sorted(VALID_SITES))}")

    if req.job_type and req.job_type not in VALID_JOB_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid job_type: {req.job_type}. Valid types: {', '.join(sorted(VALID_JOB_TYPES))}")

    if req.description_format not in VALID_DESCRIPTION_FORMATS:
        raise HTTPException(status_code=400, detail=f"Invalid description_format: {req.description_format}. Valid formats: {', '.join(sorted(VALID_DESCRIPTION_FORMATS))}")

    country_norm = normalize_country(req.country_indeed)

    site_warnings = []
    sites_to_scrape = list(req.site_name)

    if "glassdoor" in sites_to_scrape and country_norm and country_norm not in GLASSDOOR_COUNTRIES:
        sites_to_scrape.remove("glassdoor")
        site_warnings.append({
            "site": "glassdoor",
            "message": f"Glassdoor is not available for {req.country_indeed}. Removed from search.",
        })

    if "zip_recruiter" in sites_to_scrape and country_norm and country_norm not in ZIP_RECRUITER_COUNTRIES:
        sites_to_scrape.remove("zip_recruiter")
        site_warnings.append({
            "site": "zip_recruiter",
            "message": f"ZipRecruiter only supports USA/Canada. Removed from search.",
        })

    if not sites_to_scrape:
        return {
            "success": True,
            "count": 0,
            "results": [],
            "site_errors": [],
            "site_warnings": site_warnings,
        }

    kwargs = {
        "search_term": req.search_term,
        "results_wanted": req.results_wanted,
        "distance": req.distance,
        "is_remote": req.is_remote,
        "enforce_annual_salary": req.enforce_annual_salary,
        "description_format": req.description_format,
        "linkedin_fetch_description": req.linkedin_fetch_description,
        "offset": req.offset,
    }

    if req.google_search_term:
        kwargs["google_search_term"] = req.google_search_term
    if req.location:
        kwargs["location"] = req.location
    if req.job_type:
        kwargs["job_type"] = req.job_type
    if req.hours_old:
        kwargs["hours_old"] = req.hours_old
    if req.country_indeed:
        kwargs["country_indeed"] = req.country_indeed

    all_results = []
    site_errors = []

    if len(sites_to_scrape) == 1:
        result = scrape_single_site(sites_to_scrape[0], kwargs)
        if result["error"]:
            site_errors.append({"site": result["site"], "message": result["error"]})
        else:
            all_results.extend(result["results"])
    else:
        with ThreadPoolExecutor(max_workers=min(len(sites_to_scrape), 4)) as executor:
            futures = {
                executor.submit(scrape_single_site, site, kwargs): site
                for site in sites_to_scrape
            }
            for future in as_completed(futures):
                result = future.result()
                if result["error"]:
                    site_errors.append({"site": result["site"], "message": result["error"]})
                else:
                    all_results.extend(result["results"])

    all_results.sort(key=lambda x: x.get("date_posted") or "", reverse=True)

    return {
        "success": True,
        "count": len(all_results),
        "results": all_results,
        "site_errors": site_errors if site_errors else None,
        "site_warnings": site_warnings if site_warnings else None,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)