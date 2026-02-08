type Props = {
    title: string,
    subtitle?: string,
    children?: React.ReactNode
}

const PageHeader = ({ title, subtitle, children }: Props) => {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
            {children && (<div>{children}</div>)}
        </div>
    )
}

export default PageHeader