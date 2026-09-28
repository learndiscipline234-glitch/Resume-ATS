import React from "react";
import { CareerChatbot } from "@/components/CareerChatbot";

function getResumeContext() {
  try {
    const ca = JSON.parse(localStorage.getItem('lastAnalysisResult') ?? 'null');
    const role = localStorage.getItem('lastDetectedRole') ?? 'software_developer';
    if (!ca) return null;
    return {
      skills: (ca.skillMatch?.matchedSkills ?? []).map((s: any) => typeof s === 'string' ? s : s.skill).slice(0, 10),
      targetRole: role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      experienceYears: ca.resumeScore?.breakdown?.factors?.experienceYears ?? 2,
    };
  } catch { return null; }
}

export function CareerChatbotPage() {
  const ctx = getResumeContext();
  const skills        = ctx?.skills        ?? ["JavaScript", "React", "Node.js", "Python", "SQL"];
  const targetRole    = ctx?.targetRole    ?? "Software Developer";
  const experienceYears = ctx?.experienceYears ?? 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-light p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black mb-4">
            <span className="gradient-text">AI Career</span> Mentor Chat
          </h1>
          <p className="text-xl text-muted-foreground">
            Get instant, personalised career advice. Ask anything about skills, jobs, interviews, or career growth.
          </p>
          {ctx && (
            <p className="text-sm text-muted-foreground mt-2">
              Using your resume data — role: <strong>{targetRole}</strong>, {skills.length} skills loaded.
            </p>
          )}
        </div>

        <CareerChatbot
          userSkills={skills}
          targetRole={targetRole}
          experienceYears={experienceYears}
        />
      </div>
    </div>
  );
}
