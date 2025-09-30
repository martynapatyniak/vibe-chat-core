import React from "react";

type Props = {
  url: string; // np. link do mp3
};

export default function UserSound({ url }: Props) {
  return (
    <audio controls className="mt-2 w-full">
      <source src={url} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
}
