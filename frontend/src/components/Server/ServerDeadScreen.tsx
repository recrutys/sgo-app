export default function ServerDeadScreen()
{
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "80vh",
            textAlign: "center",
            gap: "12px",
            padding: "20px"
        }}>
            <h2 style={{margin: 0,fontSize: "20px"}}>СГ сломал наш бэкенд</h2>
            <p style={{color: "var(--text-secondary)", maxWidth: "360px", margin: 0}}>
                Чиним последствия. Попробуйте позже!
            </p>
        </div>
    );
}