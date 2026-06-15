
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClassData } from '@/types';

const defaultClasses: ClassData[] = [
  {
    id: 'class-1',
    name: '街舞班',
    description: '青少年街舞课程，流行舞蹈风格',
    color: '#be185d',
  },
  {
    id: 'class-2',
    name: '拉丁班',
    description: '拉丁舞基础与进阶课程',
    color: '#f59e0b',
  },
  {
    id: 'class-3',
    name: '幼儿班',
    description: '4-6岁幼儿舞蹈启蒙课程',
    color: '#0ea5e9',
  },
];

interface ClassState {
  classes: ClassData[];
  addClass: (classData: Omit<ClassData, 'id'>) => void;
  updateClass: (id: string, data: Partial<ClassData>) => void;
  deleteClass: (id: string) => void;
  getClassById: (id: string) => ClassData | undefined;
}

export const useClassStore = create<ClassState>()(
  persist(
    (set, get) => ({
      classes: defaultClasses,

      addClass: (classData) =>
        set((state) => ({
          classes: [
            ...state.classes,
            {
              ...classData,
              id: `class-${Date.now()}`,
            },
          ],
        })),

      updateClass: (id, data) =>
        set((state) => ({
          classes: state.classes.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),

      deleteClass: (id) =>
        set((state) => ({
          classes: state.classes.filter((c) => c.id !== id),
        })),

      getClassById: (id) => get().classes.find((c) => c.id === id),
    }),
    {
      name: 'dance-studio-classes',
    }
  )
);
