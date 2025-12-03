import React, { useState } from "react";
import Image from "next/image";
import { ContentItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

// Placeholder for more complex content types
const PlaceholderContent = ({ type }: { type: string }) => (
  <div className="text-center p-8">
    <p className="text-muted-foreground mb-4">
      Content type &quot;{type}&quot; is not yet implemented.
    </p>
  </div>
);

const VideoContent = ({
  item,
  onVideoEnd,
}: {
  item: ContentItem;
  onVideoEnd: () => void;
}) => {
  const videoUrl = item.file?.file_url;

  if (!videoUrl) {
    return <p className="text-destructive">Video source is missing.</p>;
  }

  return (
    <div>
      <video
        controls
        className="w-full rounded-lg"
        onEnded={onVideoEnd}
        key={videoUrl}
      >
        <source src={videoUrl} type={item.file?.mime_type || "video/mp4"} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

const TextContent = ({ item }: { item: ContentItem }) => {
  return (
    <div className="prose dark:prose-invert max-w-none p-4">
      <ReactMarkdown>{item.text_content || ""}</ReactMarkdown>
    </div>
  );
};

const UrlContent = ({ item }: { item: ContentItem }) => {
  if (!item.external_url) {
    return <p className="text-destructive">External URL is missing.</p>;
  }
  return (
    <div className="p-4">
      <p className="mb-4">
        This lesson links to an external resource. Click the button below to open
        it in a new tab.
      </p>
      <Button asChild>
        <a
          href={item.external_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Link
        </a>
      </Button>
    </div>
  );
};

const ImageContent = ({ item }: { item: ContentItem }) => {
  const imageUrl = item.file?.file_url;
  if (!imageUrl) {
    return <p className="text-destructive">Image source is missing.</p>;
  }
  return (
    <div className="relative w-full aspect-video">
      <Image
        src={imageUrl}
        alt={item.title}
        fill
        className="object-contain rounded-lg"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
      />
    </div>
  );
};

const DocumentContent = ({ item }: { item: ContentItem }) => {
  const docUrl = item.file?.file_url;
  if (!docUrl) {
    return <p className="text-destructive">Document source is missing.</p>;
  }
  return (
    <div className="p-4">
      <p className="mb-4">
        This lesson contains a document. Click the button below to download it.
      </p>
      <Button asChild>
        <a
          href={docUrl}
          download={item.file?.original_filename || item.title}
        >
          Download Document
        </a>
      </Button>
    </div>
  );
};

const AudioContent = ({
  item,
  onAudioEnd,
}: {
  item: ContentItem;
  onAudioEnd: () => void;
}) => {
  const audioUrl = item.file?.file_url;

  if (!audioUrl) {
    return <p className="text-destructive">Audio source is missing.</p>;
  }

  return (
    <div className="p-4">
      <audio
        controls
        className="w-full"
        onEnded={onAudioEnd}
        key={audioUrl}
      >
        <source src={audioUrl} type={item.file?.mime_type || "audio/mpeg"} />
        Your browser does not support the audio tag.
      </audio>
    </div>
  );
};

export const ContentRenderer = ({
  item,
  enrollmentId,
  isCompleted = false,
  onToggleComplete,
}: {
  item: ContentItem;
  onComplete?: () => void;
  enrollmentId?: string;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleCompletion = async () => {
    if (!enrollmentId || isLoading) return;

    if (onToggleComplete) {
      setIsLoading(true);
      try {
        await onToggleComplete();
      } catch (error) {
        console.error('Failed to update progress:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  let content;

  switch (item.content_type) {
    case "TEXT":
      content = <TextContent item={item} />;
      break;
    case "VIDEO":
      content = <VideoContent item={item} onVideoEnd={() => handleToggleCompletion()} />;
      break;
    case "URL":
      content = <UrlContent item={item} />;
      break;
    case "IMAGE":
      content = <ImageContent item={item} />;
      break;
    case "DOCUMENT":
      content = <DocumentContent item={item} />;
      break;
    case "AUDIO":
      content = <AudioContent item={item} onAudioEnd={() => handleToggleCompletion()} />;
      break;
    case "QUIZ":
      content = <PlaceholderContent type={item.content_type} />;
      break;
    default:
      content = <p>Unsupported content type: {item.content_type}</p>;
  }

  return (
    <div>
      <CardHeader>
        <CardTitle className="text-2xl">{item.title}</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
      <CardFooter className="flex justify-end">
        {enrollmentId && (
          <Button 
            onClick={handleToggleCompletion} 
            disabled={isLoading}
            variant={isCompleted ? "outline" : "default"}
            className="cursor-pointer"
          >
            {isLoading ? "Loading..." : isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
          </Button>
        )}
      </CardFooter>
    </div>
  );
};
