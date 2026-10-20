from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


# python uses snake_case, JSON response uses camelCase for the mobile app
class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)
