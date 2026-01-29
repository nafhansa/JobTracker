'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthUrl, exchangeCodeForToken, fetchLatestLinkedInEmails, getGmailStatus, disconnectGmail, createJobFromEmail } from '@/actions/gmail';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, RefreshCw, FileText, Trash2, CheckCircle2, Check } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

interface EmailData {
    id: string;
    snippet: string;
    subject: string;
    body: string;
    date: string;
    isApplication: boolean;
    companyName?: string;
    jobTitle?: string;
}

export default function GmailConnect() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [emails, setEmails] = useState<EmailData[]>([]);
    const [creatingIds, setCreatingIds] = useState<Set<string>>(new Set());
    const [createdIds, setCreatedIds] = useState<Set<string>>(new Set());

    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams ? searchParams.get('code') : null;
    const processingRef = useRef(false);

    // Initial check for connection
    useEffect(() => {
        if (user) {
            checkStatus(user.uid);
        }
    }, [user]);

    // Handle OAuth redirection
    useEffect(() => {
        if (code && user && !processingRef.current) {
            processingRef.current = true;
            handleAuthCode(code, user.uid);
        }
    }, [code, user]);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const checkStatus = async (uid: string) => {
        try {
            const status = await getGmailStatus(uid);
            setIsConnected(status.isConnected);
            if (status.isConnected) {
                // optional: auto fetch if connected?
                // await fetchEmails(uid);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            const url = await getAuthUrl();
            window.location.href = url;
        } catch (error) {
            console.error(error);
            addLog('Failed to get auth URL');
            setIsLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            await disconnectGmail(user.uid);
            setIsConnected(false);
            setEmails([]);
            addLog('Disconnected from Gmail.');
        } catch (error) {
            console.error(error);
            addLog('Failed to disconnect.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthCode = async (authCode: string, uid: string) => {
        setIsLoading(true);
        addLog('Exchanging code...');
        try {
            await exchangeCodeForToken(authCode, uid);
            setIsConnected(true);
            addLog('Connected successfully!');

            // Clean URL
            router.replace('/dashboard');

            // Fetch immediately
            await fetchEmails(uid);
        } catch (error) {
            console.error(error);
            addLog('Error connecting.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmails = async (uid: string) => {
        setIsLoading(true);
        try {
            const fetchedEmails = await fetchLatestLinkedInEmails(uid);
            setEmails(fetchedEmails as EmailData[]);

            if (fetchedEmails.length === 0) {
                addLog('No new LinkedIn emails found.');
            } else {
                addLog(`Fetched ${fetchedEmails.length} LinkedIn emails.`);
            }
        } catch (error) {
            console.error(error);
            addLog('Error fetching emails (Login expired?).');
            if (error instanceof Error && error.message.includes('No Gmail tokens')) {
                setIsConnected(false);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCard = async (email: EmailData) => {
        if (!user) return;

        setCreatingIds(prev => new Set(prev).add(email.id));

        try {
            await createJobFromEmail(user.uid, {
                title: email.jobTitle || 'Unknown Role',
                company: email.companyName || "Unknown Company",
                source: "Linkedin"
            });

            setCreatedIds(prev => new Set(prev).add(email.id));
            addLog(`Created job card for ${email.companyName}`);

        } catch (error) {
            console.error(error);
            addLog('Failed to create job card.');
        } finally {
            setCreatingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(email.id);
                return newSet;
            });
        }
    };

    const handleRefresh = () => {
        if (user) {
            fetchEmails(user.uid);
        }
    };

    return (
        <div className="p-5 border rounded-xl shadow-sm bg-white dark:bg-zinc-900 space-y-5 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        Auto Input from Gmail
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isConnected
                            ? "Connected to Gmail. Ready to fetch applications."
                            : "Connect your Gmail to auto-import LinkedIn job applications."}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <>
                            <Button
                                onClick={handleRefresh}
                                disabled={isLoading}
                                variant="outline"
                                size="sm"
                                className="h-9"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button
                                onClick={handleDisconnect}
                                disabled={isLoading}
                                variant="destructive"
                                size="sm"
                                className="h-9"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={handleConnect}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                            Connect Gmail
                        </Button>
                    )}
                </div>
            </div>

            {/* Email List */}
            {isConnected && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        <span>Recent Applications</span>
                        <span>{emails.length} found</span>
                    </div>

                    {emails.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                            <Mail className="w-8 h-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                            <p className="text-muted-foreground">No recent LinkedIn application emails found.</p>
                            <p className="text-xs text-muted-foreground mt-1">Try clicking Refresh if you just applied.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {emails.map((email: any) => {
                                const isCreating = creatingIds.has(email.id);
                                const isCreated = createdIds.has(email.id);
                                return (
                                    <div key={email.id} className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 ${email.isApplication ? 'bg-card hover:shadow-md border-zinc-200 dark:border-zinc-800' : 'bg-zinc-50 dark:bg-zinc-900/50 border-transparent opacity-75'}`}>
                                        <div className="space-y-1 mb-3 sm:mb-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-[15px] text-foreground line-clamp-1">
                                                    {email.jobTitle && email.companyName ? `${email.jobTitle} at ${email.companyName}` : (email.subject || "No Subject")}
                                                </p>
                                                {!email.isApplication && (
                                                    <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-medium">
                                                        Ignored
                                                    </span>
                                                )}
                                                {email.isApplication && (
                                                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 shadow-sm">
                                                        <CheckCircle2 className="w-3 h-3" /> Valid App
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{email.snippet}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Linkedin
                                                </span>
                                                <span>•</span>
                                                <span>{email.date ? new Date(parseInt(email.date)).toLocaleDateString() : 'Unknown date'}</span>
                                            </div>
                                        </div>

                                        {email.isApplication ? (
                                            <Button
                                                size="sm"
                                                className="shrink-0 transition-all"
                                                variant={isCreated ? "outline" : "secondary"}
                                                onClick={() => handleCreateCard(email)}
                                                disabled={isCreating || isCreated}
                                            >
                                                {isCreating ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                ) : isCreated ? (
                                                    <Check className="w-4 h-4 mr-2 text-emerald-500" />
                                                ) : (
                                                    <FileText className="w-4 h-4 mr-2" />
                                                )}
                                                {isCreated ? "Created" : "Create Card"}
                                            </Button>
                                        ) : (
                                            <div className="text-xs text-muted-foreground italic px-3 py-2">
                                                Not an application
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Logs Area */}
            {logs.length > 0 && (
                <div className="bg-zinc-100 dark:bg-zinc-950 p-3 rounded-lg text-[10px] font-mono max-h-32 overflow-y-auto text-muted-foreground border border-zinc-200 dark:border-zinc-800">
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1 last:mb-0">{log}</div>
                    ))}
                </div>
            )}
        </div>
    );
}
