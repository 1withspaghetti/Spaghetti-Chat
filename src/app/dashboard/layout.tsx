import DashboardLayout from "./DashboardLayout";

export default function Layout(props: {children: React.ReactNode}) {
    return (
        <DashboardLayout>{props.children}</DashboardLayout>
    )
}