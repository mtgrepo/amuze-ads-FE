import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import React from "react";

type MatchType = {
  pathname: string
  data?: unknown
  handle?: {
    crumb: string | string[] | ((data: unknown) => string | string[])
  }
}

type BreadCrumbLayoutProps = {
  matches: MatchType[]
}

export default function BreadCrumbLayout({ matches }: BreadCrumbLayoutProps) {

  // Only keep matches with handle.crumb
  const crumbs = matches.filter(match => match.handle?.crumb)

  return (
    <Breadcrumb>
      <BreadcrumbList>

        {crumbs.map((match, index) => {
          const isLast = index === crumbs.length - 1

          // Get label(s) as array
          let labels: Array<{ label: string; href?: string }> = []

          const raw = typeof match.handle!.crumb === "function"
            ? match.handle!.crumb(match.data)
            : match.handle!.crumb

          if (Array.isArray(raw)) {
            labels = raw.map(l => typeof l === "string" ? { label: l } : l)
          } else {
            labels = [{ label: raw }]
          }

          return labels.map((item, i) => {
            const lastInLabels = isLast && i === labels.length - 1
            return (
              <React.Fragment key={`${match.pathname}-${i}`}>
                {!(i === 0 && index === 0) && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {lastInLabels ? (
                    <BreadcrumbPage className="font-medium">{item.label}</BreadcrumbPage>
                  ) : !item.href ? (
                    // A section name (e.g. "Accounts") is not a page of its own.
                    <span>{item.label}</span>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={item.href || match.pathname}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            )
          })
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
