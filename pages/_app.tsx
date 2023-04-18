import "../styles/globals.css";
// import 'tailwindcss/tailwind.css'
import type { AppProps } from "next/app";
import Head from 'next/head'
import dynamic from "next/dynamic";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Header from "../components/Header";
// const Header = dynamic(() => import("../components/Header"), {
//   loading: () => <AppBar position="static" sx={{ background: "rgb(79 70 229)" }}><Container maxWidth="xl">
//   <Toolbar disableGutters></Toolbar></Container></AppBar>,
//   ssr: false,
// });


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Header />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
