import { giveAccess } from '@/utils/discord';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { getServerSession } from 'next-auth';
import { getPurchases } from '@/utils/appx';
import { authOptions } from '@/lib/auth';


const COHORT3_GUID_ROLES: string[] = '2834132434967984563';

const WEB_DEV_ROLES: string[] = [
    '321763427833462',
    '234263523745673',
    '362342345362311',
    '836543563532745',
    '3874623345732672',
    '6432543645370101'
]

const DEVOPS_ROLES: string[] = [
    '1264392230656016554',
    '1264392271659536435',
    '1264392305150918800',
    '1264392311476064369',
];

const WEB3_ROLES: string[] = [
    '1264392415280627742',
    '1264392533484634202',
    '1264392567571878039',
    '1264392616171016334',
];


const COHORT3_IDS = [13, 14, 15];

export async function POST(req: NextRequest){
    const session = await getServerSession(authOptions);
    const data = await req.json();

    if(!session || !session?.user){
        return NextResponse.json({}, { status: 401 });
    }

    const discordBulkConnect = await db.discordBulkConnect.findFirst({
        where: {
            userId: session.user.id,
            cohortId: '3'
        }
    });

    if(discordBulkConnect){
        return NextResponse.json({
            message: `You have already connected your discord account with username ${discordBulkConnect.username}. We only allow one discord connection per account. If any ended up leaving the server by mistake, please contact us in the main discord or email at 100xdevs@gmail.com`
        }, {
            status: 401
        })
    }

    const res = await getPurchases(session.user.email || '');
    if(res.type === 'error'){
        return NextResponse.json({
            message: 'Rate limited by appx please try again later'
        }, {
            status: 401
        })
    }

    const purchases = res.courses.filter((purchase: any) => COHORT3_IDS.includes(purchase.id));

    const purchaseCourseIds = purchases.map((purchase: any) => purchase.id);
    const roles: string[] = [];
    let hasWebDev = false;
    let hasDevops = false;
    let hasWeb3 = false;

    if(purchaseCourseIds.includes(14)){
        hasWebDev = true;
    };

    if(purchaseCourseIds.includes(15)){
        hasDevops = true;
    };

    if(purchaseCourseIds.includes(13)){
        hasWeb3 = true;
    }

    if(hasWebDev){
        roles.push(WEB_DEV_ROLES[Math.floor(Math.random() * WEB_DEV_ROLES.length)]);
    }

    if(hasDevops){
        roles.push(DEVOPS_ROLES[Math.floor(Math.random() * DEVOPS_ROLES.length)])
    }

    if(hasWeb3){
        roles.push(WEB3_ROLES[Math.floor(Math.random() * WEB3_ROLES.length)]);
    }

    if(!purchases?.length){
        return NextResponse.json({
            message: 'You have not bought a course yet'
        }, {
            status: 401
        })
    }

    const { discordId, discordUsername } = await giveAccess(
        data.code,
        roles,
        COHORT3_GUILD_ID,
        process.env.COHORT3_BOT_TOKEN ?? '',
        process.env.COHORT3_DISCORD_ACCESS_KEY ?? '',
        process.env.COHORT3_DISCORD_ACCESS_SECRET ?? '',
        process.env.COHORT3_DISCORD_REDIRECT_URL ?? ''
    );

    if(!discordId || !discordUsername){
        return NextResponse.json({
            message: 'Something went wrong while connecting your discord account'
        }, {
            status: 401
        });
    }

    await db.discordBulkConnect.create({
        data: {
            username: discordUsername,
            userId: session.user.id,
            discordId,
            cohortId: '3'
        }
    });

    return NextResponse.json({});
}