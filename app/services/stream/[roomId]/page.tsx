"use client";

import StreamPage from "../page";

interface RoomPageProps {
  params: {
    roomId: string;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  return <StreamPage params={params} />;
}
