'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/api/config';

export default function DebugMissedPage() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await apiClient.get<any>(API_ENDPOINTS.LOANS.MISSED);
                setData(response);
            } catch (err: any) {
                setError(err.message || String(err));
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Debug Missed Payments Data</h1>

            {loading && <div>Loading...</div>}

            {error && (
                <div className="bg-red-100 p-4 rounded mb-4 text-red-700">
                    Error: {error}
                </div>
            )}

            {data && (
                <div className="space-y-4">
                    <div className="bg-gray-100 p-4 rounded">
                        <h2 className="font-semibold mb-2">Response Structure Summary:</h2>
                        <div>Is Array? {Array.isArray(data) ? 'Yes' : 'No'}</div>
                        <div>Has .data? {data && data.data ? 'Yes' : 'No'}</div>
                        <div>Has .data.data? {data && data.data && data.data.data ? 'Yes' : 'No'}</div>
                    </div>

                    <div className="bg-gray-100 p-4 rounded overflow-auto">
                        <h2 className="font-semibold mb-2">First Item (Raw):</h2>
                        <pre className="text-xs">
                            {JSON.stringify(
                                Array.isArray(data) ? data[0] :
                                    (data?.data?.data?.[0] || data?.data?.[0] || data),
                                null, 2
                            )}
                        </pre>
                    </div>

                    <div className="bg-gray-100 p-4 rounded overflow-auto h-96">
                        <h2 className="font-semibold mb-2">Full Response:</h2>
                        <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}
