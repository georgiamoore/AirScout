import "../styles/globals.css";
// import 'tailwindcss/tailwind.css'
import type { AppProps } from "next/app";
import Head from 'next/head'
import dynamic from "next/dynamic";
const Header = dynamic(() => import("../components/Header"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});


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
