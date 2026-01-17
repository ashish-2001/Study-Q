'use client';

import { useEffect } from "react";

export function Print(){
    let opened = false;
    useEffect(() => {
        if(opened) return;
        document.querySelectorAll('details').forEach((e) => (e.open = true));
        document.querySelectorAll('header').forEach((e) => {
            e.style.display = 'none';
        });
        document.querySelectorAll('.notion-title').forEach((e: any) => {
            e.style.marginBottom = '0px';
        });

        setTimeout(() => {
            print();
            opened = true;
        }, 1000);
    }, []);
}