import LoginHeader from './LoginHeader';
import LoginForm from './LoginForm';
import LoginFooter from './LoginFooter';

export default function LoginFormSection() {
  return (
    <div className="w-full lg:w-[40%] h-full flex items-center justify-center px-6 py-6 lg:px-8 bg-fp-bg overflow-y-auto">
      <div className="w-full max-w-md space-y-4">
        <LoginHeader />
        <LoginForm />
        <LoginFooter />
      </div>
    </div>
  );
}
