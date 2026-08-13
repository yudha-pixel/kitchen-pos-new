export interface ApprovalRule {
  id: string;
  module: 'pr' | 'po' | 'invoice';
  min_amount: number;
  max_amount: number;
  required_role: 'supervisor' | 'kitchen_manager' | 'general_manager' | 'admin';
  auto_approve: boolean;
}

export const DEFAULT_APPROVAL_MATRIX: ApprovalRule[] = [
  {
    id: 'rule-1',
    module: 'pr',
    min_amount: 0,
    max_amount: 1000000,
    required_role: 'supervisor',
    auto_approve: true,
  },
  {
    id: 'rule-2',
    module: 'pr',
    min_amount: 1000001,
    max_amount: 10000000,
    required_role: 'kitchen_manager',
    auto_approve: false,
  },
  {
    id: 'rule-3',
    module: 'pr',
    min_amount: 10000001,
    max_amount: 999999999,
    required_role: 'general_manager',
    auto_approve: false,
  },
  {
    id: 'rule-4',
    module: 'po',
    min_amount: 0,
    max_amount: 50000000,
    required_role: 'kitchen_manager',
    auto_approve: false,
  },
];

export function canUserApprove(
  module: 'pr' | 'po' | 'invoice',
  amount: number,
  userRole: string = 'admin'
): boolean {
  if (userRole === 'admin' || userRole === 'owner') return true;

  const matchingRule = DEFAULT_APPROVAL_MATRIX.find(
    (rule) => rule.module === module && amount >= rule.min_amount && amount <= rule.max_amount
  );

  if (!matchingRule) return true;

  const roleHierarchy: Record<string, number> = {
    staff: 1,
    supervisor: 2,
    kitchen_manager: 3,
    general_manager: 4,
    admin: 5,
    owner: 6,
  };

  const userLevel = roleHierarchy[userRole.toLowerCase()] || 1;
  const requiredLevel = roleHierarchy[matchingRule.required_role] || 3;

  return userLevel >= requiredLevel;
}
