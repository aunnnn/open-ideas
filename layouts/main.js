import Meta from '../components/meta'
import Link from 'next/prefetch'

export default ({ children }) => (
  <div className="main">
    <div className="logo">
      <Link href="/"><a>open ideas</a></Link>
    </div>

    { children }

    { /* global styles and meta tags */ }
    <Meta />

    { /* local styles */ }
    <style jsx>{`
      .main {
        padding: 25px 50px;
      }

      .logo {
        padding-bottom: 50px;
      }

      a {
        text-decoration: none;
        font-size: 2em;
      }

      a:active {
        color: black;
      }

      @media (max-width: 500px) {
        .main {
          padding: 25px 15px;
        }

        .logo {
          padding-bottom: 20px;
        }
      }
    `}</style>
  </div>
)