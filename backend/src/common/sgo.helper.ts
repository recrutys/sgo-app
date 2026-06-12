export function getSGORequestParams(user: any): {
    studentId: string;
    headers: {
        Cookie: string
    }
}
{
    return {
        studentId: user.sgo_student_id,
        headers: {'Cookie': user.sgo_session},
    };
}