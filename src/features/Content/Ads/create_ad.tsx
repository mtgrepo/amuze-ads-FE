import { useNavigate } from "react-router-dom";
import CreateAdForm from "../../../components/Content/Ads/create_ad_form";

export default function CreateAdPage() {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl w-full mx-auto p-8">
            <CreateAdForm onSuccess={() => navigate("/ads")} />
        </div>
    )
}
