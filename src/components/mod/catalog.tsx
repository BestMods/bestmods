import { type ModRowBrowser } from "~/types/mod";
import ModSlideshow from "./slideshow";

export default function ModCatalog ({
    latestMods = [],
    viewedMods = [],
    downloadedMods = [],
    topMods = [],
    topModsToday = [],
    defaultDevice = "md"
} : {
    latestMods?: ModRowBrowser[]
    viewedMods?: ModRowBrowser[],
    downloadedMods?: ModRowBrowser[]
    topMods?: ModRowBrowser[]
    topModsToday?: ModRowBrowser[]
    defaultDevice?: string
}) {
    return (
        <div className="flex flex-col gap-4">
            {topModsToday.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2>Top Mods Today</h2>
                    <ModSlideshow
                        mods={topModsToday}
                        autoPlaySpeedMin={3000}
                        autoPlaySpeedMax={10000}
                        defaultDevice={defaultDevice}
                    />
                </div>
            )}
            {latestMods.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2>Latest Mods</h2>
                    <ModSlideshow
                        mods={latestMods}
                        autoPlaySpeedMin={3000}
                        autoPlaySpeedMax={10000}
                        defaultDevice={defaultDevice}
                    />
                </div>
            )}
            {topMods.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2>Top Mods All-Time</h2>
                    <ModSlideshow
                        mods={topMods}
                        autoPlaySpeedMin={3000}
                        autoPlaySpeedMax={10000}
                        defaultDevice={defaultDevice}
                    />
                </div>
            )}
            {viewedMods.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2>Most Viewed Mods</h2>
                    <ModSlideshow
                        mods={viewedMods}
                        autoPlaySpeedMin={3000}
                        autoPlaySpeedMax={10000}
                        defaultDevice={defaultDevice}
                    />
                </div>
            )}
            {downloadedMods.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2>Most Downloaded Mods</h2>
                    <ModSlideshow
                        mods={downloadedMods}
                        autoPlaySpeedMin={3000}
                        autoPlaySpeedMax={10000}
                        defaultDevice={defaultDevice}
                    />
                </div>
            )}
        </div>
    )
}