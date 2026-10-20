"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboardLanding() {
  return (
    <div className="min-h-screen bg-background text-text px-6 py-2 lg:px-8">
      <h1 className="text-3xl font-semibold mb-8">
        Selamat datang di Dashboard Admin.
      </h1>
    </div>
  );
}