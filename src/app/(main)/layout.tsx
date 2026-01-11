import { Appbar } from "@/components/Appbar";
import React from "react";

interface Props {
    children: React.ReactNode
}

const Layout = (props: Props) =>{
    return (
        <div className="flex min-h-screen w-full">
            <Appbar/>
            <div className="wrapper w-full">{props.children}</div>
        </div>
    )
}

export default Layout;