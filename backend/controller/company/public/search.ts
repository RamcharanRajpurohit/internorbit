import { Request, Response } from 'express';
import { CompanyProfile } from '../../../models/company-profile';


const searchCompaniesWithFilter = async (req: Request, res: Response) => {
  const { query, industry, location, page = 1, limit = 20 } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(limit);

    let searchQuery: any = {};

    if (query) {
      searchQuery.$or = [
        { company_name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    if (industry) {
      searchQuery.industry = { $regex: industry, $options: 'i' };
    }

    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' };
    }

    const total = await CompanyProfile.countDocuments(searchQuery);
    const companies = await CompanyProfile.find(searchQuery)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      companies,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export { searchCompaniesWithFilter };