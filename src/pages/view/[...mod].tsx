import { BestModsPage} from '../../components/main';

import { Mod } from "@prisma/client";
import { type NextPage } from "next";
import React, { useContext, useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/router'

import { trpc } from "../../utils/trpc";
import { ModSource, ModDownload } from '@prisma/client';

import { marked } from 'marked';

import HeadInfo from "../../components/Head";

import { ModInstallerRender, ModRatingRender } from '../../components/modbrowser';
import { ModInstaller } from '@prisma/client';

const Home: NextPage = () => {
  return (
    <>
      <HeadInfo />
      <BestModsPage
        content={<MainContent></MainContent>}
      ></BestModsPage>
    </>
  );
};

const MainContent: React.FC = () => {
  const { query } = useRouter()
  const modParam = (query.mod != null) ? query.mod[0] : null;
  const modView = (query.mod != null && query.mod[1] != null) ? query.mod[1] : 'overview';

  const modQuery = trpc.mod.getMod.useQuery({url: modParam ?? ""});
  const mod = modQuery.data;

  // View generator.
  const [isViewed, setIsViewed] = useState(false);
  const modViewMut = trpc.modView.incModViewCnt.useMutation();

  useEffect(() => {
    if (!mod || isViewed || modView != "overview")
      return;

    modViewMut.mutate({
      url: mod.url
    });

    setIsViewed(true);    
  }, [mod]);

  const [installersMenuOpen, setInstallersMenuOpen] = useState(false);

  if (mod != null) {
    let body: JSX.Element = <></>;

    // Generate classes for buttons and such.
    const btnBaseClasses = "!font-sm text-white font-bold rounded-t p-1 md:p-3 mr-1";
    const defaultStyle = "bg-cyan-900/50";
    const activeStyle = "font-bold bg-cyan-500/50";

    // Decide what content to serve.
    if (modView == "install")
      body = <ModInstall mod={mod} />;
    else if (modView == "sources")
      body = <ModSources mod={mod} />;
    else if (modView == "downloads")
      body = <ModDownloads mod={mod} />;
    else
      body = <ModOverview mod={mod} />;

    // Generate image and link URLs.
    let banner = "/images/mod/default.png";

    if (mod.banner != null)
      banner = mod.banner;

    const overviewLink = "/view/" + modParam;
    const installLink = "/view/" + modParam + "/install";
    const sourcesLink = "/view/" + modParam + "/sources";
    const downloadsLink = "/view/" + modParam + "/downloads";
    const editLink = "/admin/add/mod/" + modParam;

    // Check rating.
    const onlyRating = ((mod.ModInstaller != null && mod.ModInstaller.length > 0) || mod.ownerName != null) ? false : true;

    return (
      <>
        <div className="container mx-auto w-full">
          <div id="modHeader">
            <div className="flex justify-center">
              <img className="block rounded-t w-96 h-72" src={banner} />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-white text-center">{mod.name}</h1>
          </div>

          <div id="modButtons" className="flex justify-center">
            <a href={overviewLink} className={`${btnBaseClasses} ${modView == "overview" ? activeStyle : defaultStyle}`}>Overview</a>
            <a href={installLink} className={`${btnBaseClasses} ${modView == "install" ? activeStyle : defaultStyle}`}>Installation</a>
            <a href={sourcesLink} className={`${btnBaseClasses} ${modView == "sources" ? activeStyle : defaultStyle}`}>Sources</a>
            <a href={downloadsLink} className={`${btnBaseClasses} ${modView == "downloads" ? activeStyle : defaultStyle}`}>Downloads</a>
          </div>

          <div className="p-12 w-full rounded-b bg-cyan-900/20">
            <div className={`flex flex-wrap mb-4 ${onlyRating ? "justify-end" : "justify-between"}`}>
              {mod.ownerName != null && (
                  <div className="">
                    <p className="text-white">Maintained By <span className="font-bold">{mod.ownerName}</span></p>
                  </div>
              )}
              {mod.ModInstaller != null && mod.ModInstaller.length > 0 && (
                <div className="relative">
                  <div className="p-2 flex items-center bg-cyan-800 hover:bg-cyan-900 rounded-t">
                    <button id="installerDropdownBtn" onClick={(e) => {
                        setInstallersMenuOpen(!installersMenuOpen);
                    }} className="text-white font-bold flex items-center mx-auto" type="button"><span>Install</span> {!installersMenuOpen ? (
                      <svg className="w-4 h-4 text-center ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11251)"><path d="M7 10L12 15" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15L17 10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11251"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>
                    ) : (
                      <svg className="w-4 h-4 text-center ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_429_11224)"><path d="M17 14L12 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 9L7 14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_429_11224"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>
                    )}</button>
                  </div>
      
                  <ul id="installerDropdownMenu" className={`absolute py-2 text-sm bg-cyan-700 ${ installersMenuOpen ? "block" : "hidden" }`} aria-labelledby="installerDropdownBtn">
                  {mod.ModInstaller.map((ins: ModInstaller) => {
                    return (
                      <ModInstallerRender
                        key={mod.id + "-" + ins.sourceUrl}
                        mod={mod}
                        modIns={ins}
                      />
                      );
                  })}
                  </ul>
                </div>
              )}
              <div className="relative flex justify-center">
                <ModRatingRender
                  mod={mod}
                />
              </div>
            </div>
            <div className="text-white" id="viewContent">
              {body}
            </div>

            <div className="flex flex-row justify-center items-center">
              <a href={editLink} className="text-white bg-cyan-800 hover:bg-cyan-900 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded px-4 py-2 mt-2 max-w-xs">Edit</a>
            </div>
          </div>
        </div>
      </>
    )
  } else {
    return (
      <>
        {modQuery.isFetched && (
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-white text-center">Not Found</h1>
            <p className="text-white text-center">Mod not found. Please check the URL.</p>
          </div>
        )}
      </>
    );
  }
};

const ModOverview: React.FC<{ mod: Mod }> = ({ mod }) => {
  const data = marked(mod.description);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: data }} />
    </>
  );
};

const ModInstall: React.FC<{ mod: Mod }> = ({ mod }) => {
  const data = (mod.install != null) ? marked(mod.install) : "<p>No installation guide found.</p>";

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: data }} />
    </>
  );
};

const ModSources: React.FC<{ mod: Mod }> = ({ mod }) => {
  return (
    <>
      <h3>Sources</h3>
      {mod.ModSource != null && mod.ModSource.length > 0 && (
        <div className="relative flex flex-wrap gap-6">
          
          {mod.ModSource.map((src: ModSource) => {
            const srcQuery = trpc.source.getSource.useQuery({
              url: src.sourceUrl 
            });

            const srcData = srcQuery.data;

            let name = "Placeholder";
            let banner = "/images/source/default_banner.png";

            if (srcData != null && srcQuery.isFetched) {
              name = srcData.name;
              
              if (srcData.banner != null)
                banner = srcData.banner;
            }

            const srcLink = "https://" + src.sourceUrl + "/" + src.query;

            return (
              <a key={"src-" + src.modId + "-" + src.sourceUrl + "-" + src.query} href={srcLink} className="relative no-underline" target="_blank">
                <div className="bg-cyan-500/50 hover:bg-cyan-600/50 rounded w-72 h-48">
                  <div className="w-full h-36">
                    <img src={banner} className="w-full h-full rounded-t" />
                  </div>
                  <div className="w-full text-center">
                    <h3 className="!text-lg font-bold no-underline">{name}</h3>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
};

const ModDownloads: React.FC<{ mod: Mod }> = ({ mod }) => {
  const downloadsQuery = trpc.modDownload.getModDownloads.useQuery({
    id: mod.id
  });

  const downloads = downloadsQuery.data ?? [];

  const dlCnt: number = mod.totalDownloads ?? 0;

  return (
    <>
      <h3>Downloads</h3>
      <div className="relative flex flex-wrap gap-6">
        {downloads.map((dl: ModDownload) => {
          return (
            <a key={mod.id + "-" + dl.url} className="bg-cyan-500/50 hover:bg-cyan-600/50 rounded p-4 max-w-lg" href={dl.url} target="_blank">
              <div key={dl.modId + dl.url} className="flex items-center">
                <svg className="w-5 h-5" viewBox="0 0 512 512" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg"><path d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"/></svg>
                <span className="text-white font-lg ml-2">{dl.name}</span>
              </div>
            </a>
          );
        })}
      </div>
      <p className="text-sm mt-4">{dlCnt.toString()} Total Downloads</p>
    </>
  );
};

export default Home;
