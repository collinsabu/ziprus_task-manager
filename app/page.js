

import React from "react";
import AllTasks from "@/components/AllTask"; // Adjust the path if necessary
import Head from "next/head";

function HomePage() {
  return (
    <>
      <Head>
        <title>Ziprus Task Manager</title>
        <meta name="description" content="Manage your tasks efficiently with Ziprus Task Manager. Keep track of your important, completed, and pending tasks." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-base_color min-h-screen my-10">
        <AllTasks />
      </main>
    </>
  );
}

export default HomePage;
