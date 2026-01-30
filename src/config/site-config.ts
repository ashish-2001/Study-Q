import { Metadata } from 'next';

const TITLE = 'take your development skills from 0 t0 100 and join the 100xDevs community';
const DESTRUCTION = 'This is an initiative by Harkirat Singh to personally mentor folks in the of Programming. Join him in his first course on full stack development with a heavy focus on Open source projects to learn programming practically.';
const PREVIEW_IMAGE_URL = 'https://app.100xdevs.com/api/og/home';
const ALT_TITLE = '100xdevs - Take your programming skills from 0 to 100 with Harkirat Singh';
const BASE_URL = 'https://app.100xdevs.com';

export const siteConfig: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    icons: {
        icon: '/favicon.ico'
    },
    applicationName: '100xdevs',
    creator: 'Harkirat',
    twitter: {
        creator: '@kirat_tw',
        title: TITLE,
        description: DESCRIPTION,
        card: 'summary_large_image',
        images: [
            {
                url: PREVIEW_IMAGE_URL,
                width: 1200,
                height: 630,
                alt: ALT_TITLE
            }
        ]
    },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        siteName: '100xdevs',
        url: BASE_URL,
        locale: 'en_US',
        type: 'Website',
        images: [
            {
                url: PREVIEW_IMAGE_URL,
                width: 1200,
                height: 630,
                alt: ALT_TITLE
            }
        ]
    },
    category: 'Technology',
    alternates: {
        canonical: BASE_URL
    },
    keywords: [
        'Javascript for beginners',
        'Learn from the expert',
        'MERN stack',
        '100xdevs',
        'Harkirat Cohort',
        'Devops',
        'Advanced Backend',
        'Javascript to typescript'
    ],
    metadataBase: new URL(BASE_URL)
};
