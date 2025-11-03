import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome to TimeScope
          </h1>
          <p className="text-xl text-muted-foreground">
            A smart time-tracking software built with modern web technologies
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Track Time</CardTitle>
              <CardDescription>
                Monitor working hours based on completed tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically calculate employee working hours with precision.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Learn More</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimize Workload</CardTitle>
              <CardDescription>
                Balance tasks across your team effectively
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Distribute work efficiently and improve productivity.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Learn More</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>
                Create accurate time reports automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get detailed insights into time allocation and performance.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Learn More</Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Get Started Today</CardTitle>
            <CardDescription>
              Enter your email to start tracking time smarter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Input type="email" placeholder="Enter your email" />
              <Button className="w-full">Start Free Trial</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
