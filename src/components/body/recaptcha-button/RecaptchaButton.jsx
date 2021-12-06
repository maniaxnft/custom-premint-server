import axios from "axios";
import { useCallback, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import toast from "react-hot-toast";

export const RecaptchaButton = ({
  onClick,
  actionName = "mint",
  children = "Click to mint",
  disabled,
}: any) => {
  const [validating, setValidating] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      console.debug("Execute recaptcha not yet available");
      return;
    }
    setValidating(true);

    const token = await executeRecaptcha(actionName);
    const { data }: any = await axios.post(`/api/validate-captcha`, { token });
    if (data.success) {
      setValidating(false);
      await onClick();
    } else toast.error("You fucking bot! GTFO");
    setValidating(false);
  }, [executeRecaptcha]);

  return (
    <button
      type="button"
      className="text-black font-bold text-lg cursor-pointer"
      disabled={disabled}
      onClick={handleReCaptchaVerify}
    >
      {validating ? "Validating you are not a bot..." : children}
    </button>
  );
};
