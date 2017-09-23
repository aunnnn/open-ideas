import Head from 'next/head';

export default () => (
  <div>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>

  {/* global styles */}
  <style jsx global>{`
    * {
      margin: 0;
      box-sizing: border-box;
    }
    body {
      font: 14px "Courier New";
    }
  `}</style>
  </div>
);
