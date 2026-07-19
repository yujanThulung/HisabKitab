import { Button, Card, Form, Input, Typography, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { PATHS } from "../../constants/route";
import { useAuthStore } from "../../store/authStore";
import { loginSchema } from "../../validators/auth.validator";
import type { LoginFormData } from "../../validators/auth.validator";
import { getErrorMessage } from "../../utils/error";

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const accessToken = useAuthStore((state) => state.accessToken);

  // Redirect as soon as accessToken lands in the store — works whether the
  // user just logged in or arrives at /login with a valid existing token.
  useEffect(() => {
    if (accessToken) {
      navigate(PATHS.DASHBOARD, { replace: true });
    }
  }, [accessToken, navigate]);

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormData) => {
    try {
      const identifier = values.identifier ?? "";
      const payload = {
        identifier,
        password: values.password,
        ...(identifier.includes("@") ? { email: identifier } : { phone: identifier }),
      };

      await login(payload);
      message.success("Login successful");
      // navigate is handled by the useEffect above once accessToken is set
    } catch (error) {
      message.error(getErrorMessage(error, "Login failed"));
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <Title level={2} className="!mb-2 text-center">
          HisabKitab
        </Title>

        <Text className="mb-6 block text-center text-gray-500">
          Welcome back
        </Text>

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Controller
            name="identifier"
            control={control}
            render={({ field, fieldState }) => (
              <Form.Item
                label="Email or Phone"
                validateStatus={fieldState.error ? "error" : ""}
                help={fieldState.error?.message}
              >
                <Input
                  {...field}
                  size="large"
                  placeholder="Enter email or phone"
                />
              </Form.Item>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Form.Item
                label="Password"
                validateStatus={fieldState.error ? "error" : ""}
                help={fieldState.error?.message}
              >
                <Input.Password
                  {...field}
                  size="large"
                  placeholder="Enter password"
                />
              </Form.Item>
            )}
          />

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            style={{
              background: '#ff6b35',
              borderColor: '#ff6b35',
            }}
          >
            Login
          </Button>
        </Form>

        {/* <div className="mt-5 text-center">
          <Text>
            Don't have an account? <Link to={PATHS.REGISTER}>Register</Link>
          </Text>
        </div> */}
      </Card>
    </div>
  );
};

export default Login;
