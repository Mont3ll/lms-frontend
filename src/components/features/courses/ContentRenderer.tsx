import React from "react";
import { ContentItem } from "@/lib/types"; // Your ContentItem type
// Import potential players or viewers
// import VideoPlayer from './VideoPlayer';
// import PdfViewer from './PdfViewer';
// import QuizAttemptView from '../assessments/QuizAttemptView';

interface ContentRendererProps {
  item: ContentItem;
  onComplete?: () => void; // Callback to mark item as complete
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  item,
  onComplete,
}) => {
  if (!item)
    return <p className="text-muted-foreground">Select content to view.</p>;

  const renderContent = () => {
    switch (item.content_type) {
      case "TEXT":
        return (
          <div
            className="prose dark:prose-invert max-w-none"
            // WARNING: Only use dangerouslySetInnerHTML if text_content is guaranteed sanitized HTML
            // Otherwise, use a Markdown renderer (e.g., react-markdown)
            dangerouslySetInnerHTML={{ __html: item.text_content || "" }}
          />
        );
      case "VIDEO":
        // return <VideoPlayer url={item.external_url || item.file?.file_url} onEnded={onComplete} />;
        return (
          <p>
            Video Player Placeholder for:{" "}
            {item.external_url || "Internal Video"}
          </p>
        );
      case "DOCUMENT":
        // return <PdfViewer url={item.file?.file_url} onComplete={onComplete} />;
        return (
          <p>
            Document Viewer Placeholder for:{" "}
            {item.original_filename || "Document"}
          </p>
        );
      case "QUIZ":
        // return <QuizAttemptView assessmentId={item.assessment_id} onComplete={onComplete} />;
        return <p>Quiz/Assessment Placeholder (ID: {item.assessment_id})</p>;
      case "URL":
        return (
          <div>
            <p className="mb-4">External Link:</p>
            <a
              href={item.external_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {item.external_url}
            </a>
            {/* Consider adding an iframe preview if possible/safe */}
          </div>
        );
      // Add cases for IMAGE, AUDIO, H5P, SCORM etc.
      default:
        return (
          <p className="text-muted-foreground">
            Unsupported content type: {item.content_type_display}
          </p>
        );
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold border-b pb-2">{item.title}</h2>
      <div>{renderContent()}</div>
      {/* Optional Completion Button (might be triggered by player/viewer events too) */}
      {onComplete && (
        <div className="mt-6 pt-4 border-t">
          <Button onClick={onComplete}>Mark as Complete</Button>
        </div>
      )}
    </div>
  );
};
