'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CreateExamContent from '@/components/create-exam-content'
import MyExamsContent from '@/components/my-exams-content'

export default function ExamsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Exams</h1>

      <Tabs defaultValue="create" className="w-full">
        <TabsList>
          <TabsTrigger value="create">
            Create Exam
          </TabsTrigger>

          <TabsTrigger value="my-exams">
            Exams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <CreateExamContent />
        </TabsContent>

        <TabsContent value="my-exams">
          <MyExamsContent />
        </TabsContent>
      </Tabs>
    </div>
  )
}