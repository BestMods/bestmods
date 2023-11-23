import { useContext, useEffect } from "react"
import { ViewPortCtx } from "./main";

export default function Background ({
    background = "bg-gradient-to-b from-[#002736] to-[#00151b]",
    image = null,
    overlay = true 
}: {
    background?: string,
    image?: string | null,
    overlay?: boolean | string
}) {
    const viewPort = useContext(ViewPortCtx);

    useEffect(() => {
        if (!image)
            return;
        
    }, [image])
    return (<>
        {overlay && (
            <div id="bgol" className={typeof (overlay) === "string" ? overlay : "bg-black/80"}></div>
        )}

        <div
            id="bg"
            className={background}
            style={{
                backgroundImage: (!viewPort.isMobile && image) ? image : undefined
            }}
        >
        </div>
    </>)
}