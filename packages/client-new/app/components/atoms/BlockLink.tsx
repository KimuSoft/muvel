import { Link, type LinkProps } from "react-router"
import React from "react"

const BlockLink: React.FC<
  LinkProps & React.RefAttributes<HTMLAnchorElement>
> = ({ style, ...props }) => (
  <Link style={{ ...style, display: "block" }} {...props} />
)

export default BlockLink
