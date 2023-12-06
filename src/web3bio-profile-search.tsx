/* eslint-disable @typescript-eslint/no-explicit-any */
import { List } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useEffect, useState } from "react";
import { handleSearchPlatform } from "./utils/base";

export default function Command() {
  const [searchTerm, setSearchTerm] = useState("");
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("");
  useEffect(() => {
    const _platform = handleSearchPlatform(searchTerm || "");
    if (_platform && searchTerm) {
      setPlatform(_platform);
      setUrl("https//api.web3.bio" + `/ns/${_platform.toLowerCase()}/${searchTerm}`);
    }
  }, [searchTerm]);
  // todo: to fufill here
  console.log(platform, url);

  const { isLoading, data: profiles } =
    platform && searchTerm.length > 3
      ? useFetch(url, {
          keepPreviousData: true,
        })
      : { isLoading: false, data: [] };
  let title;

  if (searchTerm.length === 0 && !profiles) {
    title = "Please Enter";

    if (searchTerm.length > 2 && (profiles as any).length === 0) {
      title = "No results";
    }

    if (searchTerm.length > 2 && isLoading) {
      title = "Loading...";
    }

    return (
      <List
        isLoading={isLoading}
        searchBarPlaceholder="Search Ethereum (ENS), Lens, Farcaster, UD..."
        onSearchTextChange={setSearchTerm}
        throttle
      >
        <List.EmptyView title={title} icon={{ source: { light: "icon-light.png", dark: "icon-dark.png" } }} />
        {((profiles as any) || []).map((item: any) => (
          <List.Item key={item.id} title={item.title} />
        ))}
      </List>
    );
  }
}
