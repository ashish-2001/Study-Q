'use client';
import { NotionRender as NotionRenderLib } from 'react-notion';
import 'react-notion-x/src/styles.css';
import dynamic from 'next/dynamic';

const Code = dynamic(() => 
    import('react-notion-x/build/third-party/code').then((m) => m.code )
);
const Equation = dynamic(() => 
    import('react-notion-x/build/third-party/equation').then((m) => m.Equation)
);

import 'prismjs/themes/prism-tomorrow.css';
import 'katex/dist/katex.min.css';
import { Print } from './print';
import useMountStatus from '@/hooks/useMountStatus';

const PrintNotes =({ recordMap }): { recordMap: Map } => {
    const mounted = useMountStatus();

    if(!mounted){
        return null;
    }
    
    return (
        <>
            <NotionRenderLib
                recordMap={recordMap}
                fullPage={true}
                darkMode={false}
                className="z-10"
                disableHeader={true}
                components={{ Code, Equation }}
            />
            <Print/>
        </>
    )
};

export default PrintNotes;