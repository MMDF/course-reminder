export interface Course {
  code: string
  credits: number
  ects: number
  days: string[]
  hours: string[]
  instructor: string
  name: string
  rooms: string[]
  requiredForDept?: string[]
}
