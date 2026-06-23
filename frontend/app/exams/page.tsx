'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CreateExamContent from '@/components/create-exam-content'
import MyExamsContent from '@/components/my-exams-content'

export default function ExamsPage() {
  return (
    <Tabs defaultValue="create" className="w-full">
      <div className="container mx-auto px-4 pt-6 pb-0">
        <h1 className="text-3xl font-bold mb-4">Exams</h1>
        <TabsList>
          <TabsTrigger value="create">Create Exam</TabsTrigger>
          <TabsTrigger value="my-exams">Exams</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="create">
        <CreateExamContent />
      </TabsContent>

      <TabsContent value="my-exams">
        <MyExamsContent />
      </TabsContent>
    </Tabs>
  )
}
