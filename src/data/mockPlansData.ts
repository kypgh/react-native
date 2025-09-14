// Mock data interfaces for payment plans
export interface CreditPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  validityDays: number;
  features: string[];
  purchased: boolean;
}

export interface PlansScreenData {
  myPlans: {
    count: number;
    plans: CreditPlan[];
  };
  availablePlans: CreditPlan[];
}

export const mockPlansData: PlansScreenData = {
  myPlans: {
    count: 2,
    plans: [
      {
        id: 'my-1',
        name: 'Basic Fitness',
        credits: 10,
        price: 99,
        validityDays: 30,
        features: ['Access to basic classes', 'Equipment usage', 'Locker access', 'Mobile app access'],
        purchased: true
      },
      {
        id: 'my-2',
        name: 'Premium Plus',
        credits: 25,
        price: 199,
        validityDays: 60,
        features: ['Access to all classes', 'Personal trainer sessions', 'Premium equipment', 'Nutrition consultation', 'Priority booking'],
        purchased: true
      }
    ]
  },
  availablePlans: [
    {
      id: 'plan-1',
      name: 'Starter Pack',
      credits: 5,
      price: 49,
      validityDays: 15,
      features: ['Access to basic classes', 'Equipment usage', 'Mobile app access'],
      purchased: false
    },
    {
      id: 'plan-2',
      name: 'Fitness Enthusiast',
      credits: 15,
      price: 129,
      validityDays: 45,
      features: ['Access to all classes', 'Equipment usage', 'Locker access', 'Guest passes (2)', 'Group training sessions'],
      purchased: false
    },
    {
      id: 'plan-3',
      name: 'Ultimate Fitness',
      credits: 50,
      price: 399,
      validityDays: 90,
      features: ['Unlimited class access', 'Personal trainer sessions', 'Premium equipment', 'Nutrition consultation', 'Massage therapy', 'Guest passes (5)', 'Priority support'],
      purchased: true
    },
    {
      id: 'plan-4',
      name: 'Weekend Warrior',
      credits: 8,
      price: 79,
      validityDays: 30,
      features: ['Weekend class access', 'Equipment usage', 'Locker access', 'Flexible scheduling'],
      purchased: false
    }
  ]
};