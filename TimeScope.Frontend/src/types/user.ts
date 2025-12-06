export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    banner?: string;
    role: 'Admin' | 'Manager' | 'Employee';
    isActive: boolean;
    phoneNumber?: string;
    jobTitle?: string;
    department?: string;
    hireDate?: string;
    preferences?: string;
}

export const roleNumberToString = (role: number | string): 'Admin' | 'Manager' | 'Employee' => {
    if (typeof role === 'string') {
        return role as 'Admin' | 'Manager' | 'Employee';
    }
    switch (role) {
        case 0: return 'Admin';
        case 1: return 'Manager';
        case 2: return 'Employee';
        default: return 'Employee';
    }
};
