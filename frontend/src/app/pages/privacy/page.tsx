import Navbar from "@/components/Navbar/Navbar";

export default function PrivacyPage()
{
    return (
        <>
            <Navbar />

            <div className="block block-container block-row">
                <h1 style={{marginBottom: "20px", fontSize: "20px", fontWeight: 700}}>Политика конфиденциальности</h1>

                <p style={{color: "var(--text-muted)", fontSize: "13px", marginBottom: "24px"}}>
                    Последнее обновление: июнь 2026
                </p>

                <section style={{marginBottom: "24px"}}>
                    <h2 style={{fontSize: "16px", fontWeight: 600, marginBottom: "10px"}}>Какие данные обрабатываются
                    </h2>
                    <p>Для работы сервиса обрабатываются следующие данные:</p>
                    <ul style={{
                        marginTop: "8px",
                        paddingLeft: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px"
                    }}>
                        <li>Логин от Сетевого Города (СГО)</li>
                        <li>SHA-256 хэш пароля от СГО — пароль в открытом виде не сохраняется</li>
                        <li>Сессионные куки СГО — хранятся в базе данных в открытом виде, необходимы для выполнения
                            запросов к СГО от вашего имени
                        </li>
                        <li>ФИО и название учебной группы из профиля СГО</li>
                        <li>Идентификатор студента в системе СГО</li>
                        <li>Кэш оценок из электронного журнала — обновляется не чаще одного раза в 10 минут</li>
                    </ul>
                </section>

                <section style={{marginBottom: "24px"}}>
                    <h2 style={{fontSize: "16px", fontWeight: 600, marginBottom: "10px"}}>Цели обработки</h2>
                    <p>Перечисленные данные используются для отображения расписания, оценок, аттестации и экзаменов. Данные не передаются третьим лицам и не
                        используются в иных целях.
                    </p>
                </section>

                <section style={{marginBottom: "24px"}}>
                    <h2 style={{fontSize: "16px", fontWeight: 600, marginBottom: "10px"}}>Срок хранения</h2>
                    <p>Данные хранятся до момента обращения пользователя с запросом на удаление. Сессия на сайте
                        действительна в течение 7 дней с момента входа.
                    </p>
                </section>

                <section>
                    <h2 style={{fontSize: "16px", fontWeight: 600, marginBottom: "10px"}}>Удаление данных</h2>
                    <p>Вы вправе запросить удаление всех связанных с вами данных. Для этого обратитесь к администратору
                        сервиса.
                    </p>
                </section>
            </div>
        </>
    );
}