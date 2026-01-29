'use server';

import { getOAuth2Client } from '@/lib/google';
import { google } from 'googleapis';
import { adminDb } from '@/lib/firebase/admin';
import { checkIsPro } from '@/lib/firebase/subscription';
import { headers } from 'next/headers';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// Helper to get current user ID (you might need a better auth check depending on your setup)
// attempting to get uid from request header or argument if passed.
// For now, we will require userId to be passed from the client or extracted securely.

export async function getAuthUrl() {
    const oauth2Client = getOAuth2Client();

    // Generate the url that will be used for the consent dialog.
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        include_granted_scopes: true,
        prompt: 'consent', // Ensure we get a refresh token
    });

    return authUrl;
}

export async function exchangeCodeForToken(code: string, userId: string) {
    if (!userId) throw new Error("User ID required");

    const oauth2Client = getOAuth2Client();
    try {
        const { tokens } = await oauth2Client.getToken(code);

        // Save to Firestore
        await adminDb.collection('users').doc(userId).set({
            gmailTokens: tokens,
            isGmailConnected: true,
            updatedAt: new Date()
        }, { merge: true });

        return { success: true };
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        throw error;
    }
}

export async function getGmailStatus(userId: string) {
    if (!userId) return { isConnected: false };

    try {
        const doc = await adminDb.collection('users').doc(userId).get();
        const data = doc.data();

        if (data?.gmailTokens && data?.isGmailConnected) {
            return { isConnected: true };
        }
        return { isConnected: false };
    } catch (error) {
        console.error('Error checking gmail status:', error);
        return { isConnected: false };
    }
}

export async function disconnectGmail(userId: string) {
    if (!userId) throw new Error("User ID required");

    try {
        await adminDb.collection('users').doc(userId).update({
            gmailTokens: null, // field value delete would be better strictly but this works
            isGmailConnected: false
        });
        return { success: true };
    } catch (error) {
        console.error('Error disconnecting gmail:', error);
        throw error;
    }
}

export async function fetchLatestLinkedInEmails(userId: string) {
    console.log('Fetching LinkedIn emails for user:', userId);

    // 1. Get tokens from DB
    const doc = await adminDb.collection('users').doc(userId).get();
    const data = doc.data();

    if (!data?.gmailTokens) {
        throw new Error("No Gmail tokens found");
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(data.gmailTokens);

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
        const res = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10, // Increase result content to catch more potential matches
            q: 'from:linkedin.com'
        });

        const messages = res.data.messages;
        if (!messages || messages.length === 0) {
            console.log('No LinkedIn emails found.');
            return [];
        }

        const emailData = [];

        for (const message of messages) {
            const msg = await gmail.users.messages.get({
                userId: 'me',
                id: message.id!,
                format: 'full'
            });

            const snippet = msg.data.snippet;
            const payload = msg.data.payload;
            let body = '';
            let subject = '';

            // Get Headers
            if (payload?.headers) {
                const subjectHeader = payload.headers.find(h => h.name === 'Subject');
                if (subjectHeader) subject = subjectHeader.value || '';
            }

            // Simple body parsing
            if (payload?.parts) {
                for (const part of payload.parts) {
                    if (part.mimeType === 'text/plain' && part.body?.data) {
                        body += Buffer.from(part.body.data, 'base64').toString('utf-8');
                    }
                }
            } else if (payload?.body?.data) {
                body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
            }

            console.log('Email content found:', { id: message.id, snippet, subject });

            // Parsing logic matches typical LinkedIn application confirmation
            const isApplication = subject.toLowerCase().includes('application was sent to');
            let companyName = '';
            let jobTitle = '';

            if (isApplication) {
                // Typical format: "Your application was sent to [Company Name]"
                const match = subject.match(/application was sent to (.+)/i);
                if (match && match[1]) {
                    companyName = match[1].trim();
                }

                // Try to find job title in body
                // In LinkedIn confirmation emails, the job title usually follows the "Your application was sent to..." text
                const bodyLines = body.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
                const sentToIndex = bodyLines.findIndex(l => l.toLowerCase().includes('application was sent to'));
                
                if (sentToIndex !== -1 && bodyLines[sentToIndex + 1]) {
                     const potentialTitle = bodyLines[sentToIndex + 1];
                     // Filter out if it's obviously not a title or just repeating the company
                     if (potentialTitle.toLowerCase() !== companyName.toLowerCase() && 
                         !potentialTitle.toLowerCase().includes('view job') &&
                         potentialTitle.length < 100) {
                         jobTitle = potentialTitle;
                     }
                }
            }

            emailData.push({
                id: message.id,
                snippet,
                subject,
                body,
                date: msg.data.internalDate,
                isApplication,
                companyName,
                jobTitle
            });
        }

        return emailData;

    } catch (error) {
        console.error('Error fetching/parsing emails:', error);
        throw new Error('Failed to fetch emails');
    }
}

export async function createJobFromEmail(userId: string, jobData: { title: string; company: string; source: string }) {
    if (!userId) throw new Error("User ID required");

    try {
        await adminDb.collection('jobs').add({
            userId,
            jobTitle: jobData.title || "Unknown Role",
            company: jobData.company || "Unknown Company",
            industry: jobData.company || "Unknown Company", // Fallback for legacy
            applicationUrl: jobData.source || "Linkedin",
            status: {
                applied: true,
                emailed: false,
                cvResponded: false,
                interviewEmail: false,
                contractEmail: false
            },
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return { success: true };
    } catch (error) {
        console.error("Error creating job from email:", error);
        throw new Error("Failed to create job card");
    }
}
