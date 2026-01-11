import { NotionAPI } from 'notion-client';
import db from '@/db';
const notion = new NotionAPI();
import PrintNotes from '@/components/print/PrintNotes';


export default async function PrintNotion({
    params: { contentId } 
}: {
    params: { contentId: string };
}){
    const notionMetaData = await db.notionMetaData.findFirst({
        where: {
            contentId: parseInt(contentId, 10)
        }
    });

    if(notionMetaData?.notionId){
        const recordMap = await notion.getPage(notionMetaData?.notionId);
        return <PrintNotes recordMap={recordMap}/>
    }
}