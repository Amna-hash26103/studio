import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FemmoraLogo } from '@/components/icons';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mb-4 inline-block">
            <FemmoraLogo className="mx-auto h-12 w-12 text-primary" />
          </Link>
          <CardTitle className="font-headline text-2xl">
            Join FEMMORA
          </CardTitle>
          <CardDescription>
            Create your account to join our community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" asChild>
              <Link href="/feed">Create Account</Link>
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline">Google</Button>
            <Button variant="outline">Apple</Button>
            <Button variant="outline">Facebook</Button>
          </div>
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary">
              Log In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
