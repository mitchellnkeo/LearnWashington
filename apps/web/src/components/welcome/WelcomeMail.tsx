"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { WELCOME_LETTER } from "./welcome-copy";

type Stage = "envelope" | "postcard";

function PostageStamp() {
  return (
    <div className="welcome-stamp" aria-hidden="true">
      <svg viewBox="0 0 72 84" className="h-full w-full">
        <rect width="72" height="84" fill="#f4efe4" />
        <rect x="3" y="3" width="66" height="78" fill="none" stroke="#7a5c54" strokeWidth="1.4" />
        <path
          d="M18 58 28 34l8 14 6-10 12 20H18z"
          fill="#4d6f5c"
        />
        <circle cx="50" cy="22" r="7" fill="#d5e4ec" stroke="#3d6b80" strokeWidth="1.2" />
        <text
          x="36"
          y="74"
          textAnchor="middle"
          fill="#7a5c54"
          fontSize="8"
          fontWeight="700"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          WASH. 3¢
        </text>
      </svg>
    </div>
  );
}

function Postmark() {
  return (
    <svg
      className="welcome-postmark"
      viewBox="0 0 120 72"
      aria-hidden="true"
    >
      <circle cx="36" cy="36" r="28" fill="none" stroke="#7a5c54" strokeWidth="1.6" />
      <circle cx="36" cy="36" r="22" fill="none" stroke="#7a5c54" strokeWidth="0.8" />
      <text
        x="36"
        y="32"
        textAnchor="middle"
        fill="#7a5c54"
        fontSize="8"
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        SEATTLE
      </text>
      <text
        x="36"
        y="44"
        textAnchor="middle"
        fill="#7a5c54"
        fontSize="7"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        WASH.
      </text>
      <g fill="none" stroke="#7a5c54" strokeWidth="1.3">
        <path d="M68 18h48" />
        <path d="M68 28h48" />
        <path d="M68 38h48" />
        <path d="M68 48h48" />
        <path d="M68 58h48" />
      </g>
    </svg>
  );
}

export function WelcomeMail() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("envelope");
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef<number | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => {
      window.cancelAnimationFrame(frame);
      if (leaveTimer.current !== null) {
        window.clearTimeout(leaveTimer.current);
      }
    };
  }, []);

  function openMap() {
    if (leaving) {
      return;
    }
    setLeaving(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    leaveTimer.current = window.setTimeout(
      () => {
        router.push("/explore");
      },
      reduced ? 0 : 480,
    );
  }

  return (
    <main
      id="main-content"
      className={`welcome-desk ${ready ? "welcome-desk-ready" : ""} ${leaving ? "welcome-desk-leave" : ""}`}
    >
      <Link href="/explore" className="skip-link">
        Skip to the map
      </Link>

      <div className="welcome-stage">
        {stage === "envelope" ? (
          <button
            type="button"
            className="welcome-envelope"
            onClick={() => setStage("postcard")}
          >
            <span className="sr-only">
              Open the mail from Washington to you
            </span>
            <div className="welcome-envelope-face" aria-hidden="true">
              <Postmark />
              <PostageStamp />
              <div className="welcome-address">
                <p>
                  <span>From</span>
                  Washington
                </p>
                <p>
                  <span>To</span>
                  You
                </p>
              </div>
              <p className="welcome-hint">Tap to open</p>
            </div>
          </button>
        ) : (
          <article className="welcome-postcard" aria-labelledby="welcome-letter-heading">
            <figure className="welcome-photo">
              <img
                src="/media/puget-sound.jpg"
                alt="Mount Rainier rising beyond the water of Puget Sound, seen from Gig Harbor."
              />
              <PostageStamp />
            </figure>
            <div className="welcome-letter">
              <p className="welcome-kicker">{WELCOME_LETTER.kicker}</p>
              <h1 id="welcome-letter-heading" className="serif">
                {WELCOME_LETTER.greeting}
              </h1>
              {WELCOME_LETTER.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="welcome-hand">
                  {paragraph}
                </p>
              ))}
              <p className="welcome-sign">{WELCOME_LETTER.name}</p>
              <button
                type="button"
                className="btn btn-primary welcome-next"
                onClick={openMap}
              >
                Open the map
              </button>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}
