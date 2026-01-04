import { getDisabledFeature } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site-config';


function page(){
    const disabled = getDisabledFeature('qa');
    if(disabled){
        redirect('/question');
    }
    return null;
};

export async function generateMetaData({
    params
}: {
    params: { slug: string };
   }
): Promise<Metadata>{
    return {
        title: `${params.slug} | ${siteConfig.title}`
    };
}

export default page;