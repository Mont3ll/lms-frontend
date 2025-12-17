import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ContentItem, Assessment, AssessmentAttempt } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Clock,
  Target,
  RefreshCw,
  FileQuestion,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle,
  Maximize2,
  Minimize2,
  Package,
  Blocks,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  fetchAssessmentDetails,
  fetchAssessmentAttemptsForAssessment,
  getApiErrorMessage,
  updateLearnerProgress,
} from "@/lib/api";

const QuizContent = ({ item }: { item: ContentItem }) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assessmentId = item.metadata?.assessment_id as string | undefined;

  useEffect(() => {
    if (!assessmentId) {
      setIsLoading(false);
      setError("No assessment linked to this content item.");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [assessmentData, attemptsData] = await Promise.all([
          fetchAssessmentDetails(assessmentId),
          fetchAssessmentAttemptsForAssessment(assessmentId),
        ]);
        setAssessment(assessmentData);
        setAttempts(attemptsData);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [assessmentId]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-4 mt-4">
          <Skeleton className="h-16 w-32" />
          <Skeleton className="h-16 w-32" />
          <Skeleton className="h-16 w-32" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!assessment) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Available</AlertTitle>
        <AlertDescription>
          This quiz is not currently available.
        </AlertDescription>
      </Alert>
    );
  }

  // Check attempt status
  const inProgressAttempt = attempts.find((a) => a.status === "IN_PROGRESS");
  const completedAttempts = attempts.filter(
    (a) => a.status === "SUBMITTED" || a.status === "GRADED"
  );
  const attemptsUsed = completedAttempts.length;
  const hasRemainingAttempts =
    assessment.max_attempts === 0 || attemptsUsed < assessment.max_attempts;

  // Get best score from graded attempts
  const gradedAttempts = attempts.filter((a) => a.status === "GRADED");
  const bestScore =
    gradedAttempts.length > 0
      ? Math.max(
          ...gradedAttempts.map((a) =>
            a.max_score && a.max_score > 0
              ? ((a.score ?? 0) / a.max_score) * 100
              : 0
          )
        )
      : null;
  const hasPassed = gradedAttempts.some((a) => a.is_passed);

  return (
    <div className="p-4 space-y-6">
      {/* Assessment Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileQuestion className="h-5 w-5 text-primary" />
          <Badge variant="outline">{assessment.assessment_type_display}</Badge>
          {hasPassed && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Passed
            </Badge>
          )}
        </div>
        {assessment.description && (
          <p className="text-muted-foreground">{assessment.description}</p>
        )}
      </div>

      {/* Assessment Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {assessment.time_limit_minutes && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Time Limit</p>
              <p className="font-medium">{assessment.time_limit_minutes} min</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Target className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Pass Mark</p>
            <p className="font-medium">{assessment.pass_mark_percentage}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <RefreshCw className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Attempts</p>
            <p className="font-medium">
              {attemptsUsed} /{" "}
              {assessment.max_attempts === 0 ? "∞" : assessment.max_attempts}
            </p>
          </div>
        </div>
        {bestScore !== null && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            {hasPassed ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <p className="text-xs text-muted-foreground">Best Score</p>
              <p className="font-medium">{bestScore.toFixed(0)}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Previous Attempts */}
      {completedAttempts.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Previous Attempts</h4>
          <div className="space-y-2">
            {completedAttempts.slice(0, 3).map((attempt, index) => (
              <Link
                key={attempt.id}
                href={`/learner/assessments/attempt/${attempt.id}`}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    #{completedAttempts.length - index}
                  </span>
                  <span className="text-sm">
                    {new Date(attempt.start_time).toLocaleDateString()}
                  </span>
                  {attempt.status === "GRADED" && (
                    <Badge
                      variant={attempt.is_passed ? "default" : "destructive"}
                      className={attempt.is_passed ? "bg-green-600" : ""}
                    >
                      {attempt.is_passed ? "Passed" : "Failed"}
                    </Badge>
                  )}
                  {attempt.status === "SUBMITTED" && (
                    <Badge variant="secondary">Pending Review</Badge>
                  )}
                </div>
                {attempt.status === "GRADED" &&
                  attempt.score != null &&
                  attempt.max_score != null && (
                    <span className="font-medium">
                      {((attempt.score / attempt.max_score) * 100).toFixed(0)}%
                    </span>
                  )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {inProgressAttempt ? (
          <Button asChild>
            <Link
              href={`/learner/assessments/${assessmentId}/attempt?resume=${inProgressAttempt.id}`}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Resume Attempt
            </Link>
          </Button>
        ) : hasRemainingAttempts ? (
          <Button asChild>
            <Link href={`/learner/assessments/${assessmentId}/attempt`}>
              <PlayCircle className="h-4 w-4 mr-2" />
              {attemptsUsed === 0 ? "Start Quiz" : "New Attempt"}
            </Link>
          </Button>
        ) : (
          <Button disabled variant="outline">
            No Attempts Remaining
          </Button>
        )}
      </div>
    </div>
  );
};

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
  // Use standard img tag instead of Next.js Image to support dynamic URLs
  // from various storage backends (S3, local storage, etc.) without requiring
  // explicit domain allowlisting in next.config.ts
  return (
    <div className="relative w-full flex justify-center p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={item.title}
        className="max-w-full max-h-[70vh] object-contain rounded-lg"
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

// SCORM API data structure for tracking
interface ScormData {
  cmi_core_lesson_status?: string;
  cmi_core_lesson_location?: string;
  cmi_core_score_raw?: number;
  cmi_core_score_min?: number;
  cmi_core_score_max?: number;
  cmi_suspend_data?: string;
  cmi_core_total_time?: string;
  cmi_core_session_time?: string;
  [key: string]: string | number | undefined;
}

const ScormContent = ({
  item,
  enrollmentId,
  onComplete,
}: {
  item: ContentItem;
  enrollmentId?: string;
  onComplete?: () => void;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scormData, setScormData] = useState<ScormData>({});
  const [error] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const scormUrl = item.file?.file_url || item.external_url;
  const scormVersion = (item.metadata?.scorm_version as string) || "1.2";

  // Persist SCORM data to the server
  const persistScormData = useCallback(
    async (data: ScormData) => {
      if (!enrollmentId) return;

      try {
        const completionStatus = data.cmi_core_lesson_status;
        const isCompleted =
          completionStatus === "completed" ||
          completionStatus === "passed";

        await updateLearnerProgress(enrollmentId, item.id, {
          status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
          progress_details: {
            scorm_version: scormVersion,
            lesson_status: completionStatus,
            lesson_location: data.cmi_core_lesson_location,
            score_raw: data.cmi_core_score_raw,
            score_min: data.cmi_core_score_min,
            score_max: data.cmi_core_score_max,
            suspend_data: data.cmi_suspend_data,
            total_time: data.cmi_core_total_time,
          },
        });

        if (isCompleted && onComplete) {
          onComplete();
        }
      } catch (err) {
        console.error("Failed to persist SCORM data:", err);
      }
    },
    [enrollmentId, item.id, scormVersion, onComplete]
  );

  // Handle messages from the SCORM content iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate message origin in production
      if (!event.data || typeof event.data !== "object") return;

      const { type, key, value, api } = event.data;

      // Handle SCORM API calls
      if (api === "SCORM" || api === "SCORM_2004") {
        switch (type) {
          case "LMSInitialize":
          case "Initialize":
            setIsInitialized(true);
            // Send response back to iframe
            iframeRef.current?.contentWindow?.postMessage(
              { type: "LMSInitializeResponse", result: "true" },
              "*"
            );
            break;

          case "LMSSetValue":
          case "SetValue":
            if (key && value !== undefined) {
              setScormData((prev) => {
                const newData = { ...prev, [key]: value };
                return newData;
              });
            }
            iframeRef.current?.contentWindow?.postMessage(
              { type: "LMSSetValueResponse", result: "true" },
              "*"
            );
            break;

          case "LMSGetValue":
          case "GetValue":
            const responseValue = scormData[key] || "";
            iframeRef.current?.contentWindow?.postMessage(
              { type: "LMSGetValueResponse", key, value: responseValue },
              "*"
            );
            break;

          case "LMSCommit":
          case "Commit":
            persistScormData(scormData);
            iframeRef.current?.contentWindow?.postMessage(
              { type: "LMSCommitResponse", result: "true" },
              "*"
            );
            break;

          case "LMSFinish":
          case "Terminate":
            persistScormData(scormData);
            iframeRef.current?.contentWindow?.postMessage(
              { type: "LMSFinishResponse", result: "true" },
              "*"
            );
            break;

          case "LMSGetLastError":
          case "GetLastError":
            iframeRef.current?.contentWindow?.postMessage(
              { type: "LMSGetLastErrorResponse", error: "0" },
              "*"
            );
            break;

          default:
            break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [scormData, persistScormData]);

  // Inject SCORM API adapter into the iframe
  useEffect(() => {
    if (!iframeRef.current || !scormUrl) return;

    const injectScormApi = () => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;

      // Send SCORM API adapter script to the iframe
      const apiScript = `
        (function() {
          var API = {
            LMSInitialize: function() {
              window.parent.postMessage({ api: 'SCORM', type: 'LMSInitialize' }, '*');
              return 'true';
            },
            LMSSetValue: function(key, value) {
              window.parent.postMessage({ api: 'SCORM', type: 'LMSSetValue', key: key, value: value }, '*');
              return 'true';
            },
            LMSGetValue: function(key) {
              window.parent.postMessage({ api: 'SCORM', type: 'LMSGetValue', key: key }, '*');
              return '';
            },
            LMSCommit: function() {
              window.parent.postMessage({ api: 'SCORM', type: 'LMSCommit' }, '*');
              return 'true';
            },
            LMSFinish: function() {
              window.parent.postMessage({ api: 'SCORM', type: 'LMSFinish' }, '*');
              return 'true';
            },
            LMSGetLastError: function() { return '0'; },
            LMSGetErrorString: function() { return ''; },
            LMSGetDiagnostic: function() { return ''; }
          };
          
          // SCORM 1.2
          window.API = API;
          
          // SCORM 2004
          window.API_1484_11 = {
            Initialize: API.LMSInitialize,
            SetValue: API.LMSSetValue,
            GetValue: API.LMSGetValue,
            Commit: API.LMSCommit,
            Terminate: API.LMSFinish,
            GetLastError: API.LMSGetLastError,
            GetErrorString: API.LMSGetErrorString,
            GetDiagnostic: API.LMSGetDiagnostic
          };
        })();
      `;

      iframe.contentWindow.postMessage(
        { type: "injectScormApi", script: apiScript },
        "*"
      );
    };

    const iframe = iframeRef.current;
    iframe.addEventListener("load", injectScormApi);

    return () => {
      iframe.removeEventListener("load", injectScormApi);
    };
  }, [scormUrl]);

  const toggleFullscreen = useCallback(() => {
    if (!iframeRef.current) return;

    if (!isFullscreen) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!scormUrl) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>SCORM package source is missing.</AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between p-2 bg-muted rounded-t-lg">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            SCORM {scormVersion} Content
          </span>
          {isInitialized && (
            <Badge variant="outline" className="text-xs">
              Connected
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          className="h-8 w-8 p-0"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
      <iframe
        ref={iframeRef}
        src={scormUrl}
        className="w-full border-0 rounded-b-lg bg-white"
        style={{ height: isFullscreen ? "100vh" : "600px" }}
        title={item.title}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        allow="fullscreen"
      />
    </div>
  );
};

// H5P xAPI statement structure
interface XAPIStatement {
  verb?: {
    id?: string;
    display?: Record<string, string>;
  };
  result?: {
    completion?: boolean;
    success?: boolean;
    score?: {
      raw?: number;
      min?: number;
      max?: number;
      scaled?: number;
    };
    duration?: string;
  };
  object?: {
    id?: string;
    definition?: {
      name?: Record<string, string>;
      type?: string;
    };
  };
}

const H5pContent = ({
  item,
  enrollmentId,
  onComplete,
}: {
  item: ContentItem;
  enrollmentId?: string;
  onComplete?: () => void;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error] = useState<string | null>(null);
  const completedRef = useRef(false);

  const h5pUrl = item.file?.file_url || item.external_url;
  const h5pContentId = item.metadata?.h5p_content_id as string | undefined;

  // Handle xAPI statements from H5P content
  const handleXAPIStatement = useCallback(
    async (statement: XAPIStatement) => {
      if (!enrollmentId) return;

      const verbId = statement.verb?.id || "";
      const isCompleted =
        verbId.includes("completed") ||
        verbId.includes("passed") ||
        statement.result?.completion === true;
      const isPassed = statement.result?.success === true;
      const score = statement.result?.score;

      // Only persist meaningful interactions
      if (
        isCompleted ||
        isPassed ||
        score?.raw !== undefined ||
        verbId.includes("answered") ||
        verbId.includes("attempted")
      ) {
        try {
          // Determine status based on completion state
          const status = isCompleted && !completedRef.current 
            ? 'COMPLETED' as const
            : 'IN_PROGRESS' as const;

          await updateLearnerProgress(enrollmentId, item.id, {
            status,
            progress_details: {
              h5p_content_id: h5pContentId,
              last_verb: verbId,
              completion: statement.result?.completion,
              success: statement.result?.success,
              score_raw: score?.raw,
              score_min: score?.min,
              score_max: score?.max,
              score_scaled: score?.scaled,
              duration: statement.result?.duration,
            },
          });

          if (isCompleted && !completedRef.current) {
            completedRef.current = true;
            if (onComplete) {
              onComplete();
            }
          }
        } catch (err) {
          console.error("Failed to persist H5P progress:", err);
        }
      }
    },
    [enrollmentId, item.id, h5pContentId, onComplete]
  );

  // Listen for xAPI statements from the H5P iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      // Handle H5P xAPI messages
      if (event.data.context === "h5p" || event.data.type === "xAPI") {
        const statement = event.data.statement || event.data;
        if (statement.verb) {
          handleXAPIStatement(statement);
        }
      }

      // Handle H5P resize messages
      if (event.data.context === "h5p" && event.data.action === "resize") {
        if (iframeRef.current && event.data.height) {
          iframeRef.current.style.height = `${event.data.height}px`;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleXAPIStatement]);

  const toggleFullscreen = useCallback(() => {
    if (!iframeRef.current) return;

    if (!isFullscreen) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleIframeLoad = () => {
    setIsLoaded(true);
  };

  if (!h5pUrl) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>H5P content source is missing.</AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between p-2 bg-muted rounded-t-lg">
        <div className="flex items-center gap-2">
          <Blocks className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            H5P Interactive Content
          </span>
          {isLoaded && (
            <Badge variant="outline" className="text-xs">
              Ready
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          className="h-8 w-8 p-0"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
      {!isLoaded && (
        <div className="absolute inset-0 top-10 flex items-center justify-center bg-muted/50">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">
              Loading H5P content...
            </span>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={h5pUrl}
        className="w-full border-0 rounded-b-lg bg-white"
        style={{ height: isFullscreen ? "100vh" : "600px", minHeight: "400px" }}
        title={item.title}
        onLoad={handleIframeLoad}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        allow="fullscreen"
      />
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
      content = <QuizContent item={item} />;
      break;
    case "SCORM":
      content = (
        <ScormContent
          item={item}
          enrollmentId={enrollmentId}
          onComplete={onToggleComplete}
        />
      );
      break;
    case "H5P":
      content = (
        <H5pContent
          item={item}
          enrollmentId={enrollmentId}
          onComplete={onToggleComplete}
        />
      );
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
