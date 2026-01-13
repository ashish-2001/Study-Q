'use client';
import Script from "next/script";
const GA_TRACKING_ID = 'G-3Z2X5XN9DG';

export const GoogleAnalytics = () => {
    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https:///www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                onLoad={() => {
                    window.dataLayer = window.dataLayer || [];

                    function gtag(){
                        dataLayer.push(arguments);
                    }

                    gtag('js', new Date());
                    gtag('config', 'G-3Z2X5XN9DG');
                }}
            />
        </>
    );
};