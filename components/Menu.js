import Link from 'next/link'

export default ({ loggedIn }) => (
  <div className="menu">
    {loggedIn ? 
      <span><Link prefetch href="/logout"><a>logout</a></Link>{" | "}</span>
      :
      <span><Link prefetch href="/login"><a>login</a></Link>{" | "}</span>
    }
    <Link prefetch href="/about"><a>about</a></Link>
    <style jsx>{`
      .menu {
        padding-bottom: 20px;
      }
    `}</style>
  </div>
)
