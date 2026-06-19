'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllExams, deleteExam, type Exam } from '@/lib/exam-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CheckCircle2,
  ListChecks,
  Pencil,
  Trash2,
  FileQuestion,
  CalendarDays,
} from 'lucide-react'

export function MyExams() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loaded, setLoaded] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Exam | null>(null)

  const refresh = () => setExams(getAllExams())

  useEffect(() => {
    refresh()
    setLoaded(true)
  }, [])

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteExam(pendingDelete.code)
    setPendingDelete(null)
    refresh()
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const countByType = (exam: Exam) => {
    const tf = exam.questions.filter((q) => q.type === 'true_false').length
    const mc = exam.questions.filter((q) => q.type === 'multiple_choice').length
    return { tf, mc }
  }

  return (
    <div>
      {!loaded ? null : exams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileQuestion className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">You haven&apos;t published any exams yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create an exam in the Create Exam tab and it will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => {
            const { tf, mc } = countByType(exam)
            return (
              <Card key={exam.code}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-mono tracking-wide">
                        {exam.code}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        Published {formatDate(exam.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/exams/${encodeURIComponent(exam.code)}`}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Manage
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setPendingDelete(exam)}
                        title="Delete exam"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <ListChecks className="w-3 h-3" />
                      {exam.questions.length} question
                      {exam.questions.length === 1 ? '' : 's'}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {tf} True/False
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <ListChecks className="w-3 h-3" />
                      {mc} Multiple choice
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete exam</DialogTitle>
            <DialogDescription>
              This permanently removes exam{' '}
              <span className="font-mono font-semibold">{pendingDelete?.code}</span> and all of its
              questions. Students will no longer be able to join with this code.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
