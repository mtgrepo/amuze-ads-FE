import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useLoginCommand } from "../Composable/Command/auth/useLoginCommand";
import { Spinner } from "./ui/spinner";

const formSchema = z.object({
  email: z.string().min(1, { message: "Email is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const { loginMutation, isLoading } = useLoginCommand();
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await loginMutation(values);

    } catch (error) {
      toast.error(`${error}`);
    }

  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Amuze Ad account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="password"
                            placeholder="********"
                            type={isVisible ? "text" : "password"}
                            className="pr-9"
                            {...field}
                          />
                          <Button
                            variant="ghost"
                            type="button"
                            size="icon"
                            onClick={toggleVisibility}
                            className="absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
                          >
                            {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                            <span className="sr-only">{isVisible ? "Hide password" : "Show password"}</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Field>
                  <Button type="submit" disabled={isLoading}>{isLoading && <Spinner />} Login</Button>
                </Field>
                </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
