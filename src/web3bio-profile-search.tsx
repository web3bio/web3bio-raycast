/* eslint-disable @typescript-eslint/no-explicit-any */
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useEffect, useState } from "react";
import { handleSearchPlatform } from "./utils/base";

export default function Command() {
  const [searchTerm, setSearchTerm] = useState("");
  const [url, setUrl] = useState("https://api.web3.bio/");
  const platform = handleSearchPlatform(searchTerm);

  useEffect(() => {
    if (searchTerm && platform) {
      setUrl("https://api.web3.bio/" + `profile/${searchTerm.toLowerCase()}`);
    }
  }, [searchTerm]);
  let title;
  const {
    isLoading,
    data: profiles,
    mutate,
  } = useFetch(url, {
    parseResponse: async (res) => {
      try {
        return await res.json();
      } catch (e) {
        return [];
      }
    },
    keepPreviousData: true,
  });
  if (searchTerm.length === 0) {
    title = "Please Enter";
    if (searchTerm.length > 2 && !platform) {
      title = "invalidIdentity";
    }
    if (searchTerm.length > 2 && !profiles?.length) {
      title = "No Results";
    }
  }
  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search Ethereum (ENS), Lens, Farcaster, UD..."
      onSearchTextChange={setSearchTerm}
      throttle
      actions={
        <ActionPanel>
          <Action title="Enter to fetch" onAction={() => mutate()} />
        </ActionPanel>
      }
    >
      <List.EmptyView title={title} icon={"logo-web3bio.png"} />
      {!profiles || profiles?.error ? (
        <List.Item title={profiles?.error || 'unknown error'} icon="😂" />
      ) : (
        profiles?.map((item: any) => (
          <List.Item
            key={item.identity+item.platform}
            title={`${item.identity}(${item.platform})`}
            actions={
              <ActionPanel>
                <Action.Push
                  title="Show Profile"
                  icon={Icon.AppWindowSidebarLeft}
                  target={<ProfileResults profile={item} />}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
  function ProfileResults({ profile }: { profile: any }) {
    return (
      <List>
        <List.Section title="overview">
          <List.Item
            title={profile.identity}
            detail={<List.Item.Detail metadata={<List.Item.Detail.Metadata.Label title={profile.address} />} />}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser
                  title="Open in Web3bio profile page"
                  url={"https://web3.bio/" + profile.identity}
                />
              </ActionPanel>
            }
          ></List.Item>
        </List.Section>
      </List>
    );
  }
}
