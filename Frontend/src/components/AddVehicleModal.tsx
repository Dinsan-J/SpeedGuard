import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddVehicleModal = ({ isOpen, onClose, onSuccess }: AddVehicleModalProps) => {
  const { toast } = useToast();
  const [newVehicle, setNewVehicle] = useState({
    plateNumber: "",
    make: "",
    model: "",
    year: "",
    color: "",
    registrationExpiry: "",
    insuranceExpiry: "",
    iotDeviceId: "",
  });

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://speedguard-gz70.onrender.com/api/vehicle/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify(newVehicle),
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Vehicle Added",
          description: "Your vehicle was added successfully.",
        });
        setNewVehicle({
          plateNumber: "",
          make: "",
          model: "",
          year: "",
          color: "",
          registrationExpiry: "",
          insuranceExpiry: "",
          iotDeviceId: "",
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Add Vehicle</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleAddVehicle} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plate Number */}
            <div className="md:col-span-2">
              <label className="block text-black font-medium mb-2">
                Plate Number *
              </label>
              <input
                type="text"
                placeholder="e.g., ABC123"
                value={newVehicle.plateNumber}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, plateNumber: e.target.value })
                }
                className="w-full border rounded px-3 py-2 text-black placeholder:text-gray-400"
                required
              />
            </div>

            {/* Make */}
            <div>
              <label className="block text-black font-medium mb-2">
                Make *
              </label>
              <input
                type="text"
                placeholder="e.g., Toyota"
                value={newVehicle.make}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, make: e.target.value })
                }
                className="w-full border rounded px-3 py-2 text-black placeholder:text-gray-400"
                required
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-black font-medium mb-2">
                Model *
              </label>
              <input
                type="text"
                placeholder="e.g., Corolla"
                value={newVehicle.model}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, model: e.target.value })
                }
                className="w-full border rounded px-3 py-2 text-black placeholder:text-gray-400"
                required
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-black font-medium mb-2">
                Year *
              </label>
              <input
                type="text"
                placeholder="e.g., 2020"
                value={newVehicle.year}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, year: e.target.value })
                }
                className="w-full border rounded px-3 py-2 text-black placeholder:text-gray-400"
                required
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-black font-medium mb-2">
                Color *
              </label>
              <input
                type="text"
                placeholder="e.g., White"
                value={newVehicle.color}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, color: e.target.value })
                }
                className="w-full border rounded px-3 py-2 text-black placeholder:text-gray-400"
                required
              />
            </div>

            {/* Registration Expiry */}
            <div>
              <label className="block text-black font-medium mb-2">
                Registration Expiry *
              </label>
              <input
                type="date"
                value={newVehicle.registrationExpiry}
                onChange={(e) =>
                  setNewVehicle({
                    ...newVehicle,
                    registrationExpiry: e.target.value,
                  })
                }
                className="w-full border rounded px-3 py-2 text-black"
                required
              />
            </div>

            {/* Insurance Expiry */}
            <div>
              <label className="block text-black font-medium mb-2">
                Insurance Expiry *
              </label>
              <input
                type="date"
                value={newVehicle.insuranceExpiry}
                onChange={(e) =>
                  setNewVehicle({
                    ...newVehicle,
                    insuranceExpiry: e.target.value,
                  })
                }
                className="w-full border rounded px-3 py-2 text-black"
                required
              />
            </div>

            {/* IoT Device ID */}
            <div className="md:col-span-2">
              <label className="block text-black font-medium mb-2">
                IoT Device ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., IOT-DEVICE-001"
                value={newVehicle.iotDeviceId}
                onChange={(e) =>
                  setNewVehicle({
                    ...newVehicle,
                    iotDeviceId: e.target.value,
                  })
                }
                className="w-full border rounded px-3 py-2 text-black placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-600 mt-1">
                Enter your IoT device ID to enable real-time speed tracking
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <Button type="submit" className="flex-1">
              Add Vehicle
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;
